import { Track } from './track';

export class Categories{
    id: number;
    name: string;
    trackCount: number; //num tracks
    tracks: Array<Track>;
    img: string;
}
