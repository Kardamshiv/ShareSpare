// ============================================
// GLOBAL APP STATE
// All shared data lives here
// ============================================

export type Category = 'cab' | 'study' | 'sports';

export type Request = {
  id:          string;
  title:       string;
  cat:         Category;
  time:        string;
  loc:         string;
  poster:      string;   // initials
  posterName:  string;
  color:       string;
  accepted:    boolean;
  isMine:      boolean;
  maxMembers?:     number;   // cab sharing limit
  currentMembers?: number;   // current members joined
};

export type Message = {
  id:   string;
  text: string;
  sent: boolean;        // true = me, false = them
  time: string;
};

export type Notification = {
  id:     string;
  icon:   string;
  bg:     string;
  text:   string;
  time:   string;
  unread: boolean;
};

// ── Initial requests (mock data) ──
export const initialRequests: Request[] = [
  {
    id: 'r1', title: 'Cab to Airport – Sunday 6 AM',
    cat: 'cab', time: '6:00 AM, Sun', loc: 'Gate B',
    poster: 'PM', posterName: 'Priya Mehta',
    color: '#F59E0B', accepted: false, isMine: false,
    maxMembers: 4, currentMembers: 1,
  },
  {
    id: 'r2', title: 'DSA prep – need study partner',
    cat: 'study', time: '2 hrs/day', loc: 'Library C',
    poster: 'AP', posterName: 'Arjun Patel',
    color: '#10B981', accepted: false, isMine: false,
  },
  {
    id: 'r3', title: 'Cricket partner – Saturday 4 PM',
    cat: 'sports', time: 'Sat 4:00 PM', loc: 'Ground A',
    poster: 'KN', posterName: 'Kabir Nair',
    color: '#3B82F6', accepted: false, isMine: false,
  },
  {
    id: 'r4', title: 'Cab to City Mall – Friday 3 PM',
    cat: 'cab', time: 'Fri 3:00 PM', loc: 'Gate A',
    poster: 'SJ', posterName: 'Sneha Joshi',
    color: '#F59E0B', accepted: false, isMine: false,
    maxMembers: 3, currentMembers: 2,
  },
  {
    id: 'r5', title: 'ML exam prep – Today 6 PM',
    cat: 'study', time: 'Today 6 PM', loc: 'Lab 2',
    poster: 'RD', posterName: 'Riya Desai',
    color: '#10B981', accepted: false, isMine: false,
  },
];

export const initialNotifications: Notification[] = [
  { id:'n1', icon:'✅', bg:'#ECFDF5', text:'Priya Mehta accepted your cab request!', time:'2 min ago', unread:true },
  { id:'n2', icon:'🤝', bg:'#EEF2FF', text:'New match! Arjun Sharma needs DSA partner.', time:'15 min ago', unread:true },
  { id:'n3', icon:'🚗', bg:'#FFFBEB', text:'2 students interested in your Airport request.', time:'1 hr ago', unread:true },
  { id:'n4', icon:'⭐', bg:'#FEF3C7', text:'Sneha Joshi gave you 5 stars!', time:'Yesterday', unread:false },
  { id:'n5', icon:'💬', bg:'#EEF2FF', text:'Kabir Nair sent you a message.', time:'2 days ago', unread:false },
];

// ── Cat helpers ──
export const catIcon  = (cat: Category) =>
  ({ cab:'🚗', study:'📚', sports:'⚽' }[cat]);

export const catLabel = (cat: Category) =>
  ({ cab:'Cab Sharing', study:'Study Help', sports:'Sports' }[cat]);

export const catColor = (cat: Category) =>
  ({ cab:'#F59E0B', study:'#10B981', sports:'#3B82F6' }[cat]);

export const catBg = (cat: Category) =>
  ({ cab:'#FFFBEB', study:'#ECFDF5', sports:'#EFF6FF' }[cat]);

export const catTextColor = (cat: Category) =>
  ({ cab:'#92400E', study:'#065F46', sports:'#1E40AF' }[cat]);