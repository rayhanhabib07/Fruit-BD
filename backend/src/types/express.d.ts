import { PublicUser } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}
