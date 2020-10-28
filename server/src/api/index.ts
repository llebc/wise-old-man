import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import { isTesting } from '../env';
import hooks from './hooks';
import jobs from './jobs';
import router from './routing';

const RATE_LIMIT_MINUTES = 5;
const RATE_LIMIT_REQUESTS = 500;

class API {
  express: Express;

  constructor() {
    this.express = express();

    if (!isTesting()) {
      this.setupServices();
    }

    this.setupMiddlewares();
    this.setupRouting();
  }

  setupMiddlewares() {
    this.express.set('trust proxy', 1);

    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cors());

    // Limits 500 requests per ip, every 5 minutes
    this.express.use(
      rateLimit({
        windowMs: RATE_LIMIT_MINUTES * 60 * 1000,
        max: RATE_LIMIT_REQUESTS
      })
    );
  }

  setupRouting() {
    this.express.use('/api', router);
  }

  setupServices() {
    jobs.init();
    hooks.setup();
  }
}

export default new API().express;
