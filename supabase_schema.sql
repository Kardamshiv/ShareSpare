-- User Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  initials text not null,
  avatar_url text,
  username text,
  pronouns text,
  bio text,
  link text,
  gender text default 'Not specified',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Requests Table
create table public.requests (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  category text not null,
  time text not null,
  location text not null,
  poster_id uuid references public.profiles(id) not null,
  status text default 'open',
  max_members integer,
  color text default '#F59E0B',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.requests enable row level security;

-- Requests Policies
create policy "Requests are viewable by everyone." on requests for select using (true);
create policy "Authenticated users can insert requests." on requests for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own requests." on requests for update using (auth.uid() = poster_id);
create policy "Users can delete their own requests." on requests for delete using (auth.uid() = poster_id);

-- Request Members (Join Table)
create table public.request_members (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.requests(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (request_id, user_id)
);

-- Enable RLS
alter table public.request_members enable row level security;

-- Request Members Policies
create policy "Request members are viewable by everyone." on request_members for select using (true);
create policy "Authenticated users can join requests." on request_members for insert with check (
  auth.role() = 'authenticated' and 
  auth.uid() != (select poster_id from public.requests where id = request_id)
);
create policy "Users can leave requests." on request_members for delete using (auth.uid() = user_id);

-- Notifications
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  icon text not null,
  background_color text not null,
  text text not null,
  unread boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications." on notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications." on notifications for insert with check (true);
create policy "Users can update their own notifications." on notifications for update using (auth.uid() = user_id);
create policy "Users can delete their own notifications." on notifications for delete using (auth.uid() = user_id);

-- Set up Database Functions and Triggers
-- Automatically create profile row when user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, initials)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'initials');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Chats (User-to-User)
create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references public.profiles(id) on delete cascade not null,
  user2_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user1_id, user2_id),
  check (user1_id < user2_id)
);

alter table public.chats enable row level security;
create policy "Users can view their chats" on chats for select using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Users can insert their chats" on chats for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- Messages
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Users can view messages in their chats" on messages for select using (
  exists (
    select 1 from public.chats c
    where c.id = messages.chat_id and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
  )
);

create policy "Authenticated users can insert messages" on messages for insert with check (auth.uid() = sender_id);

-- Enable Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table requests, messages, chats, notifications;
commit;

-- Set up chat_media Storage Bucket
insert into storage.buckets (id, name, public) values ('chat_media', 'chat_media', true) on conflict do nothing;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'chat_media' );
create policy "Authenticated users can upload media" on storage.objects for insert with check ( bucket_id = 'chat_media' and auth.role() = 'authenticated' );
create policy "Users can update own media" on storage.objects for update using ( bucket_id = 'chat_media' and auth.role() = 'authenticated' );
create policy "Users can delete own media" on storage.objects for delete using ( bucket_id = 'chat_media' and auth.role() = 'authenticated' );
