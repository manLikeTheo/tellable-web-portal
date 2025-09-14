// pages/api/portal/track-click.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token required' });
  }

  try {
    // Update invitation click tracking
    const { error } = await supabase
      .from('collaboration_invites')
      .update({
        clicked_at: new Date().toISOString(),
        status: 'clicked'
      })
      .eq('token', token)
      .eq('status', 'pending');

    if (error) {
      console.error('Click tracking error:', error);
      return res.status(500).json({ error: 'Failed to track click' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Click tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
