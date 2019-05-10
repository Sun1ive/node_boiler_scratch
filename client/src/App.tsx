import React, { useEffect } from 'react';
import { ConnectionService } from './services/connection.service';

export const App = () => {
  useEffect(() => {
    const i = ConnectionService.instance;
    i.socket.on('ordersChanged', (d: any) => {
      console.log('ordersChanged %o', d);
    });
    i.getOrders()
      .then(console.log)
      .catch(console.log);
    // i.socket.removeAllListeners();
    return () => {};
  }, []);

  return (
    <div className='container'>
      <div>
        <img src='/public/pchela.jpg' alt='' />
        <img src='/public/photo.jpeg' alt='' />
        <img src='/public/close.svg' alt='' />
      </div>
    </div>
  );
};
