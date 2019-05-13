import React, { useEffect } from 'react';
import { ConnectionService } from './services/connection.service';

export const App = () => {
  useEffect(() => {
    const i = ConnectionService.instance;
    console.log(i);
    console.log(process.env.HOST);
  }, []);

  return (
    <div className="container">
      <div>
        <img src="/public/pchela.jpg" alt="" />
        <img src="/public/photo.jpeg" alt="" />
        <img src="/public/close.svg" alt="" />
      </div>
    </div>
  );
};
