interface Response {
  token: string;
}

export class ExampleServer {

  public static async generateJwt(props: { authKey: string, userId: string }): Promise<string> {

    return new Promise<string>((resolve, reject) => {

      const url = 'https://api.courier.com/auth/issue-token';
      const request = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${props.authKey}`
        },
        body: JSON.stringify({
          scope: `user_id:${props.userId} write:user-tokens inbox:read:messages inbox:write:events read:preferences write:preferences read:brands`,
          expires_in: '2 days'
        })
      };

      fetch(url, request)
        .then(response => response.json())
        .then((data: Response) => {
          resolve(data.token);
        })
        .catch(error => {
          reject(error);
        });

    });

  }

  public static async sendTest(props: { authKey: string, userId: string, channel: string, title?: string, body?: string }): Promise<string> {
    const url = 'https://api.courier.com/send';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${props.authKey}`,
    };
    const body = JSON.stringify({
      'message': {
        'to': {
          'user_id': props.userId
        },
        'content': {
          'title': props.title ?? 'Test',
          'body': props.body ?? 'Body',
        },
        'routing': {
          'method': 'all',
          'channels': [props.channel],
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
      return json['requestId'] ?? 'Error';
    } else {
      throw new Error('Failed to send test message');
    }
  }

}

export class Utils {

  static generateUUID(): string {
    let uuid = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 16; i++) {
      uuid += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return uuid;
  }

}