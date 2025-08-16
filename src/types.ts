export type VoteType = 'fake' | 'trust';

export type NewsStatus = 'fake' | 'disputed' | 'trusted'

export interface News {
  id: number;
  // eg. Is Satya finally got a boyfriend?.
  title: string;
  status: NewsStatus;
  // eg. a post from user called "Totally not a fakes news" claim that Satya has got a boyfriend.
  shortDetail: string;
  // eg. As of today 16 Aug 3679. a social media post claiming Satya finally got a boyfriend has gone
  // viral after user call "Totally not a fake news" post a shocking news that Satya got a boyfriend
  fullDetail: string;
  reporter: string;
  imageUrl: string | null;
  totalVotes: {
    fake: number;
    trust: number;
  }
}

export interface NewsInput {
  title: string;
  shortDetail: string;
  fullDetail: string;
  imageUrl: string | null;
}

export interface Comment {
  id: number;
  userId: string;
  vote: VoteType;
  text: string;
  imageUrl: string | null;
  timestamp: string;
}

export interface CommentPayload {
  newsId: number;
  vote: VoteType;
  text: string;
  imageUrl: string | null;
}
