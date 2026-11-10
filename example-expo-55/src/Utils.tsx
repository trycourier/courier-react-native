interface Response {
  token: string;
}

export class ExampleServer {
  public static async generateJwt(props: {
    authKey: string;
    userId: string;
    baseUrl?: string;
  }): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const base = props.baseUrl ?? 'https://api.courier.com';
      const url = `${base}/auth/issue-token`;
      const request = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${props.authKey}`,
        },
        body: JSON.stringify({
          scope: `user_id:${props.userId} write:user-tokens inbox:read:messages inbox:write:events read:preferences write:preferences read:brands`,
          expires_in: '2 days',
        }),
      };

      fetch(url, request)
        .then((response) => response.json())
        .then((data: Response) => {
          resolve(data.token);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  public static async sendTest(props: {
    authKey: string;
    userId: string;
    channel: string;
    title?: string;
    body?: string;
    baseUrl?: string;
  }): Promise<string> {
    const base = props.baseUrl ?? 'https://api.courier.com';
    const url = `${base}/send`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${props.authKey}`,
    };
    const body = JSON.stringify({
      message: {
        to: {
          user_id: props.userId,
        },
        content: {
          title: props.title ?? 'Test',
          body: props.body ?? 'Body',
        },
        routing: {
          method: 'all',
          channels: [props.channel],
        },
      },
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    if (response.status === 202) {
      const json = await response.json();
      if (!json.requestId) {
        throw new Error('Send returned no requestId');
      }
      return json.requestId;
    } else {
      throw new Error('Failed to send test message');
    }
  }

  public static async getUserTokens(props: {
    authKey: string;
    userId: string;
    baseUrl?: string;
  }): Promise<{ token: string; provider_key: string }[]> {
    const base = props.baseUrl ?? 'https://api.courier.com';
    const url = `${base}/users/${encodeURIComponent(props.userId)}/tokens`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${props.authKey}` },
    });

    // A user with no tokens yet can come back as not found
    if (response.status === 404) {
      return [];
    }
    if (!response.ok) {
      throw new Error(`Failed to get user tokens (${response.status})`);
    }
    const json = await response.json();
    return json.tokens ?? [];
  }

  // The message as the send pipeline tracks it. Opens show up here within seconds,
  // well before the inbox message list shows them.
  public static async getMessage(props: {
    authKey: string;
    messageId: string;
    baseUrl?: string;
  }): Promise<{ status?: string; opened?: number } | undefined> {
    const base = props.baseUrl ?? 'https://api.courier.com';
    const response = await fetch(`${base}/messages/${props.messageId}`, {
      headers: { Authorization: `Bearer ${props.authKey}` },
    });
    if (!response.ok) {
      return undefined;
    }
    return response.json();
  }
}

export class Utils {
  static generateUUID(): string {
    let uuid = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 16; i++) {
      uuid += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return uuid;
  }
}
