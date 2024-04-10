import { extractFileNameFromURL } from '../../services/videoFileService';

describe('extractFileNameFromURL', () => {
    test('Test normal URL', () => {
        let url = "https://storagebortube.blob.core.windows.net/bortube-container/3_bee.mp4";
        let expectFileName = "3_bee.mp4";
        expect(extractFileNameFromURL(url)).toBe(expectFileName);
    });
});