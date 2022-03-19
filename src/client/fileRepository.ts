import axios from 'axios';

export const generateFileURL = (
    book_id: number,
    filename: string,
    useInternalIP: boolean = true,
) =>
    useInternalIP
        ? `http://192.168.0.212:30001/v1/image/library/${book_id}/${filename}`
        : `https://file.madome.app/v1/image/library/${book_id}/${filename}`;

export const getFile = <T = any>(book_id: number, filename: string) =>
    axios.get<T>(generateFileURL(book_id, filename)).then((r) => r.data);
