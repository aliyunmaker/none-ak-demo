import { CameraOutlined } from '@ant-design/icons';
import OSS from 'ali-oss';
import { Button, Divider, Spin, Steps, Typography, message } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from './TokenContext';

const { Title } = Typography;
const { Step } = Steps;

const SecondPage: React.FC = () => {
  const { tokenData, requestId, photoUrl, setPhotoUrl } = useToken();
  const [imageUrl, setImageUrl] = useState<string | null>(photoUrl);
  const [isPhotoUploaded, setIsPhotoUploaded] = useState(!!photoUrl);
  const [uploading, setUploading] = React.useState(false);
  const navigate = useNavigate();
  
  const handleCapturePhoto = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.capture = 'environment';

    document.body.appendChild(input);
    
    if (navigator.userAgent.toLowerCase().indexOf('android') === -1) {
      input.accept = 'image/*';
    } else {
      input.accept = 'image/*;capture=camera';
    }
    input.value = ''; // 重置 input 的值
    input.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setImageUrl(imageUrl);
        setPhotoUrl(null);  // 重置全局照片URL
        setIsPhotoUploaded(false); // 重置上传状态
      }
    });
    input.click();
  };

  const handleUploadPhoto = async () => {
    if (!tokenData) {
      message.error('请先获取STS Token');
      setPhotoUrl(null);
      navigate('/'); // 跳转回第一页
      return;
    }

    if (imageUrl) {
      try {
        setIsPhotoUploaded(false);
        setUploading(true);

        // 初始化 OSS 客户端
        const client = new OSS({
          region: 'oss-cn-hangzhou',
          accessKeyId: tokenData.accessKeyId,
          accessKeySecret: tokenData.accessKeySecret,
          stsToken: tokenData.securityToken,
          bucket: 'none-ak-demo-img',
          secure: true,
        });

        const file = await fetch(imageUrl).then(res => res.blob());
        const fileName = `demo/${requestId}.jpg`; // 生成文件名

        const result = await client.put(fileName, file);

        if (result.res.status === 200) {
          setIsPhotoUploaded(true);
          setPhotoUrl(imageUrl); // 保存上传成功的图片URL到全局状态
          message.success('照片上传成功！');
        } else {
          throw new Error('OSS 上传失败');
        }
      } catch (error: any) {
        if (error.name === 'SecurityTokenExpiredError' || error.name === 'InvalidAccessKeyIdError') {
            message.error('STS Token 已过期，请重新获取');
            setPhotoUrl(null);
            navigate('/'); // 跳转回第一页
        } else {
            message.error('照片上传失败，请重试。');
            console.error(error);
        }
      } finally {
        setUploading(false);
      }
    } else {
      message.error('请先拍摄照片');
    }
  };

  const handleNextStep = () => {
    if (isPhotoUploaded) {
      navigate('/third');
    } else {
      message.error('请先上传照片');
    }
  };

  const handlePreviousStep = () => {
    navigate('/');
  };

  return (
    <div style={{ padding: '16px', maxWidth: '375px', margin: '0 auto' }}>
      <Title level={3} style={{ textAlign: 'center' , marginTop: '30px', marginBottom: '30px'}}>临时凭证体验</Title>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px', marginBottom: '25px', marginLeft: '35px'}}>
        <Steps current={1} direction="horizontal" responsive={false} style={{ width: '100%' }}>
          <Step style={{ flex: 0.5 }} />
          <Step style={{ flex: 0.5 }} />
          <Step style={{ flex: 0.5 }} />
          <Step style={{ flex: 0.5 }} /> 
        </Steps>
      </div>

      <Divider>2. 使用STS Token上传现场照片</Divider>

      <div 
        style={{ 
          width: '350px', 
          height: '250px', 
          border: '2px solid #d9d9d9', 
          borderRadius: '20px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto', 
          marginBottom: '24px',
          overflow: 'hidden',
          cursor: 'pointer',
          backgroundSize: 'cover',
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none'
        }} 
        onClick={handleCapturePhoto}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {!imageUrl && <CameraOutlined style={{ fontSize: '48px', color: '#3DA3F5' }} /> }
          {!imageUrl && <Typography.Text>点击拍照</Typography.Text> } 
        </div>
      </div>

      <Spin spinning={uploading}>
          <Button 
              type="primary" 
              onClick={handleUploadPhoto} 
              style={{ width: '100%', marginBottom: '24px' }}
              disabled={!imageUrl || uploading || isPhotoUploaded}
              size='large'
          >
              上传照片
          </Button>
      </Spin>


      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          style={{ width: '48%' }}
          onClick={handlePreviousStep}
        >
          上一步
        </Button>
        <Button 
          type="primary" 
          style={{ width: '48%' }} 
          onClick={handleNextStep} 
          disabled={!isPhotoUploaded}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default SecondPage;
