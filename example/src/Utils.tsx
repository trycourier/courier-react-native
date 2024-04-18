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
          console.log("HEEEEE: " + JSON.stringify(data as any))
          resolve(data.token);
        })
        .catch(error => {
          reject(error);
        });

    });

  }

}