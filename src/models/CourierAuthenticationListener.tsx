import { EmitterSubscription } from 'react-native';
import Courier from '..';

export class CourierAuthenticationListener {
  readonly listenerId: string;
  public onUserChanged?: EmitterSubscription;

  constructor(id: string) {
    this.listenerId = id;
  }

  public async remove() {
    // Remove the native authentication listener
    await Courier.shared.removeAuthenticationListener({
      listenerId: this.listenerId,
    });

    // Remove the emitter
    this.onUserChanged?.remove();
  }
}
