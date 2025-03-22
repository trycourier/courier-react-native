export class InboxAction {
  readonly content?: string | null;
  readonly href?: string | null;
  readonly data?: { [key: string]: any } | null;

  constructor(
    content: string | null = null,
    href: string | null = null,
    data: { [key: string]: any } | null = null
  ) {
    this.content = content;
    this.href = href;
    this.data = data;
  }

  static fromJson(jsonString: string): InboxAction {
    try {
      const parsed = JSON.parse(jsonString);
      return new InboxAction(
        parsed.content,
        parsed.href,
        parsed.data
      );
    } catch (error) {
      console.log(`Error parsing action: ${error}`);
      throw error;
    }
  }
}