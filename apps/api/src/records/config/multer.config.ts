import { BadRequestException } from '@nestjs/common';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_FILE_COUNT = 5;

export const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      ),
      false,
    );
  }
};

export const multerOptions = {
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFileFilter,
};
