import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

export const FIREBASE_PROVIDER = 'FIREBASE_ADMIN';

export const FirebaseProvider = {
  inject: [ConfigService],
  provide: FIREBASE_PROVIDER,
  useFactory: (configService: ConfigService) => {
    const serviceAccount = {
      projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
      clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      privateKey: configService
        .get<string>('FIREBASE_PRIVATE_KEY')
        ?.replace(/\\n/g, '\n'),
    };

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  },
};
