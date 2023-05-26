import { google, gmail_v1, Auth } from 'googleapis';

const QUERY_LIST = [
  'from:no-reply@fliptalk.online',
  'subject:Fliptalk: Tu session conversacional has sido programada exitosamente',
  'is:unread',
];

interface EmailData {
  emailId: string | number;
}

export class GmailService {
  gmail: gmail_v1.Gmail;

  constructor(auth: any) {
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async getEmailList() {
    const { data } = await this.gmail.users.messages.list({
      userId: 'me',
      q: QUERY_LIST.join(' '),
      maxResults: 1,
    });

    const messageList = data.messages;
    if (!messageList || messageList.length === 0) {
      return [];
    }

    return messageList;
  }

  async getEmailData({ emailId }: EmailData) {
    const { data } = await this.gmail.users.messages.get({
      userId: 'me',
      id: `${emailId}`,
      format: 'full',
    });

    return data;
  }

  async markAsRead({ emailId }: EmailData) {
    const { data } = await this.gmail.users.messages.modify({
      userId: 'me',
      id: `${emailId}`,
      requestBody: {
        addLabelIds: [],
        removeLabelIds: ['UNREAD'],
      },
    });

    return data;
  }
}
