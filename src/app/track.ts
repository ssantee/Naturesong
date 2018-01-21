export class Track{
    id: string;
    name: string;
    description: string;
    image: string;
    fileName: string;
    category: string;
    tags: Array<string>;
    playing?: boolean = false;
    fav?: boolean = false;
    duration: number;
}
