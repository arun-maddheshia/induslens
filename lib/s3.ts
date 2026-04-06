import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

/**
 * Uploads a file to S3 and returns the public URL.
 * @param body - File content as a Uint8Array
 * @param key - S3 object key (e.g. "images/articles/poster-image/123_abc.jpg")
 * @param contentType - MIME type of the file
 */
export async function uploadToS3(
  body: Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )

  const region = process.env.AWS_REGION!
  const bucket = process.env.AWS_S3_BUCKET_NAME!
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}
