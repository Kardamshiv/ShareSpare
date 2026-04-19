-- User Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  initials text not null,
  avatar_url text,
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
create policy "Authenticated users can join requests." on request_members for insert with check (auth.role() = 'authenticated');
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
