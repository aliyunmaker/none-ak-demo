import { Button, Divider, Image, Steps, Typography, message } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Step } = Steps;

const FourthPage: React.FC = () => {
  const navigate = useNavigate();
  const imageUrl = 'arch.jpg';  // 本地图片路径

  const handleSaveImage = () => {
    // 创建一个隐藏的<a>标签来下载图片
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = '架构原理图.jpg'; // 保存的图片名称
    document.body.appendChild(link);
    link.click();
    // document.body.removeChild(link);
    message.success('图片保存成功！');
  };

  return (
    <div style={{ padding: '16px', maxWidth: '375px', margin: '0 auto' }}>
      <Title level={3} style={{ textAlign: 'center' , marginTop: '30px', marginBottom: '30px'}}>临时凭证体验</Title>

    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px', marginBottom: '25px', marginLeft: '35px'}}>
    <Steps current={3} direction="horizontal" responsive={false} style={{ width: '100%' }}>
        <Step style={{ flex: 0.5 }} />
        <Step style={{ flex: 0.5 }} />
        <Step style={{ flex: 0.5 }} />
        <Step style={{ flex: 0.5 }} /> 
    </Steps>
    </div>

    <Divider>4. 原理架构图展示</Divider>

      <div 
        style={{ 
          width: '100%', 
          height: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '24px',
          border: '1px solid #d9d9d9',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <Image
            width={400}
            src={imageUrl} 
        />
      </div>

      <Button 
        type="primary" 
        onClick={handleSaveImage} 
        style={{ width: '100%', marginBottom: '24px' }}
        size='large'
      >
        保存图片
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          style={{ width: '48%' }}
          onClick={() => navigate('/third')}
        >
          上一步
        </Button>
        <Button 
          type="primary" 
          style={{ width: '48%' }} 
          onClick={() => message.success('感谢您的参与')}
        >
          完成
        </Button>
      </div>
    </div>
  );
};

export default FourthPage;
