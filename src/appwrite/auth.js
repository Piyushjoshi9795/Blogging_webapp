import conf from "../conf/conf.js";
import { Client, Account, ID, AppwriteException } from "appwrite";

export class AuthService {
  client = new Client();
  account;

  constructor() {
    this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
  }

  async createAccount({ email, password, name }) {
    try {
      const userAccount = await this.account.create(ID.unique(), email, password, name);
      if (userAccount) {
        // Automatically log in the user after account creation
        return this.login({ email, password });
      }
      return userAccount;
    } catch (error) {
      console.error("Appwrite service :: createAccount :: error", error);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error("Appwrite service :: login :: error", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      if (error instanceof AppwriteException) {
        if (error.code === 401) {
          console.error("Appwrite service :: getCurrentUser :: error: Unauthorized access");
          // Handle unauthenticated state, possibly redirect to login
        } else if (error.code === 403) {
          console.error("Appwrite service :: getCurrentUser :: error: Forbidden access");
          // Handle forbidden access
        }
      } else {
        console.error("Appwrite service :: getCurrentUser :: error", error);
      }
      return null;
    }
  }

  async logout() {
    try {
      await this.account.deleteSessions();
    } catch (error) {
      console.error("Appwrite service :: logout :: error", error);
    }
  }
}

const authService = new AuthService();

export default authService;
