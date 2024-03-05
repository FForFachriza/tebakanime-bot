export interface ResponseTypes {
  frameCount: number;
  error: string;
  result: Result[];
}

interface Result {
  anilist: number;
  filename: string;
  episode: number;
  from: number;
  to: number;
  similarity: number;
  video: string;
  image: string;
}
