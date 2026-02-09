import { getUrl } from "aws-amplify/storage";

class S3BucketService {
  async getImageUrl(imagePath) {
    if (!imagePath) {
      throw new Error("Provide valid image path.");
    }

    const { url } = await getUrl({
      path: imagePath,
      options: {
        // ensure object exists before getting url
        validateObjectExistence: true,
        // expiresIn: 300, // url expiration time in seconds.
      },
    });

    return url.toString();
  }
}

const s3BucketService = new S3BucketService();
export default s3BucketService;
