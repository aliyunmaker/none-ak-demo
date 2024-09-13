import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TokenData {
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
  expiration: string;
}

interface TokenContextProps {
  tokenData: TokenData | null;
  setTokenData: (data: TokenData | null) => void;
  photoUrl: string | null;
  setPhotoUrl: (url: string | null) => void;
  requestId: string | null;
  setRequestId: (url: string | null) => void;
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
}

const TokenContext = createContext<TokenContextProps | undefined>(undefined);

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};

export const TokenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  return (
    <TokenContext.Provider value={{ tokenData, setTokenData, photoUrl, setPhotoUrl, requestId, setRequestId, imageUrls, setImageUrls }}>
      {children}
    </TokenContext.Provider>
  );
};
