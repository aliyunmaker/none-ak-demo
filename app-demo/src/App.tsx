import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import FirstPage from './Step1';
import SecondPage from './Step2';
import ThirdPage from './Step3';
import FourthPage from './Step4';
import { TokenProvider } from './TokenContext';

const App: React.FC = () => {
  return (
    <TokenProvider>
      <Router>
        <Routes>
          <Route path="/" element={<FirstPage />} />
          <Route path="/second" element={<SecondPage />} />
          <Route path="/third" element={<ThirdPage />} />
          <Route path="/fourth" element={<FourthPage />} />
        </Routes>
      </Router>
    </TokenProvider>
  );
};

export default App;
