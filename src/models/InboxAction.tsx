import Courier from '..';

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

  /**
   * The id Courier uses to attribute a click to this action.
   *
   * It travels on the action rather than on the message, so a click is recorded against the
   * button the user actually pressed. A template that opts out of tracking arrives without one.
   */
  get trackingId(): string | undefined {
    const value = this.data?.trackingId;
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }

  /**
   * Reports a click on this action.
   *
   * `CourierInboxView` already does this for you — the native inbox reports the click when an
   * action is pressed. Call this yourself when you render your own action buttons. A no-op when
   * the action carries no tracking id.
   * @param messageId - The ID of the message this action belongs to.
   */
  async markAsClicked(messageId: string): Promise<void> {
    const trackingId = this.trackingId;

    if (!trackingId) {
      return;
    }

    const client = await Courier.shared.getClient();
    await client?.inbox.click({ messageId, trackingId });
  }

  static fromJson(jsonString: string): InboxAction {
    try {
      const parsed = JSON.parse(jsonString);
      return new InboxAction(parsed.content, parsed.href, parsed.data);
    } catch (error) {
      console.log(`Error parsing action: ${error}`);
      throw error;
    }
  }
}
