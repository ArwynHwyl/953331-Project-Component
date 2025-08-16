export type VoteType = 'fake' | 'trust';

export type NewsStatus = 'fake' | 'disputed' | 'trusted' | 'under-review'

export interface Comment {
  id: number;
  // For now let just treat user id as their username
  userId: string;
  vote: VoteType;
  text: string;
  imageUrl: string | null;
  timestamp: string;
}

export interface NewsItem {
  id: number;
  // eg. Is Satya finally got a boyfriend?.
  title: string;
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
  comments: Comment[]
  timestamp: string;
}

export interface HomeNewsItem extends Omit<NewsItem, "fullDetail" | "totalVotes" | "comments"> {
  fakeVotes: number;
  trustVotes: number;
  totalVotesCount: number;
  commentCount: number;
  status: NewsStatus;
};

export interface DetailedNewsItem extends Omit<NewsItem, 'totalVotes'> {
  fakeVotes: number;
  trustVotes: number;
  totalVotesCount: number;
  commentCount: number;
  status: NewsStatus;
}

export interface NewsPayload {
  title: string;
  shortDetail: string;
  fullDetail: string;
  reporter: string;
  imageUrl: string | null;
}

export interface CommentPayload {
  newsId: number;
  userId: string;
  vote: VoteType;
  text: string;
  imageUrl: string | null;
}
