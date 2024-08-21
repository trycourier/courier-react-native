import Courier from "../../src";

describe('Example', () => {

  it('Something', async () => {

    const token = await Courier.shared.getToken({ key: 'Hey' });
    console.log(token);

  });

});