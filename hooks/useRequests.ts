import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Request } from '../store/AppStore';

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRequests() {
    setLoading(true);
    // Fetch all requests
    const { data: reqData, error: reqError } = await supabase
      .from('requests')
      .select('*, profiles(full_name, initials)')
      .order('created_at', { ascending: false });

    if (!reqError && reqData) {
      const formatted: Request[] = reqData.map((r: any) => ({
        id: r.id,
        title: r.title,
        cat: r.category as any,
        time: r.time,
        loc: r.location,
        poster: r.profiles?.initials || '??',
        posterName: r.profiles?.full_name || 'Anonymous',
        color: r.color,
        accepted: false,
        isMine: false,
        maxMembers: r.max_members || undefined,
        currentMembers: 1, // Optional: count from request_members
      }));
      setRequests(formatted);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchRequests();

    // Subscribe to realtime updates
    const subscription = supabase.channel('public:requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { requests, fetchRequests, loading };
}
