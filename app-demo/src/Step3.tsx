import OSS from 'ali-oss';
import { Button, Divider, Image, message, Spin, Steps, Typography } from 'antd';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from './TokenContext';

const { Title } = Typography;
const { Step } = Steps;


const ThirdPage: React.FC = () => {
  const { tokenData, photoUrl, setPhotoUrl, requestId, imageUrls, setImageUrls } = useToken();
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshed, setRefreshed] = useState<boolean>(false);
  const navigate = useNavigate();
  const initialLoad = useRef(true);

  const fetchImagesFromOSS = useCallback(async () => {
    try {
      setLoading(true);
      if (!tokenData) {
        message.error('请先获取STS Token');
        setImageUrls([]);
        setPhotoUrl(null);
        navigate('/');
        return;
      }
      // 初始化 OSS 客户端
      const client = new OSS({
          region: 'oss-cn-hangzhou',
          accessKeyId: tokenData.accessKeyId,
          accessKeySecret: tokenData.accessKeySecret,
          stsToken: tokenData.securityToken,
          bucket: 'none-ak-demo-img',
          secure: true,
      });

      // 列出 bucket 中的所有文件
      const result = await client.list({
        prefix: 'demo/',
        delimiter: '/',
        'max-keys': 100,
      }, {
        timeout: 3000,
      });

      if (result.objects && result.objects.length > 0) {
        // 从中随机选择 4 张图片
        const selectedImages = [];
        let allImages = result.objects.map(obj => obj.name);
        if(!refreshed && photoUrl && requestId) {
            allImages = allImages.filter((e) => {
                return !e.includes(requestId);
            })
        } 
        while (selectedImages.length < 4 && allImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * allImages.length);
          const fileName = allImages.splice(randomIndex, 1)[0];
          const url = client.signatureUrl(fileName, {
            expires: 3600
          });
          selectedImages.push(url);
        }
        if(!refreshed && photoUrl) {
            selectedImages.splice(0, selectedImages.length === 4? 1: 0, photoUrl)
        }
        setImageUrls(selectedImages);
      } else {
        message.warning('未找到图片');
        setImageUrls([]);
      }
    } catch (error: any) {
        if (error.name === 'SecurityTokenExpiredError' || error.name === 'InvalidAccessKeyIdError') {
            message.error('STS Token 已过期，请重新获取');
            setImageUrls([]);
            setPhotoUrl(null);
            navigate('/'); // 跳转回第一页
        } else {
            message.error('获取图片失败，请重试。');
            console.error('获取图片错误:', error);
        }
    } finally {
      setLoading(false);
    }
  }, [tokenData, navigate, photoUrl, setPhotoUrl, refreshed, requestId, setImageUrls]);
  
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      if (!imageUrls || imageUrls.length === 0) {
        fetchImagesFromOSS();
      }
    }
  }, [photoUrl, imageUrls, tokenData, navigate, fetchImagesFromOSS]);

  
  const handleNextBatch = () => {
    setRefreshed(true);
    fetchImagesFromOSS();
  };

  const handleNextStep = () => {
    if (imageUrls && imageUrls.length > 0) {
      navigate('/fourth');
    } else {
      message.error('请等待图片加载完成');
    }
  };

  const handlePreviousStep = () => {
    navigate('/second');
  };

  return (
    <div style={{ padding: '16px', maxWidth: '375px', margin: '0 auto' }}>
      <Title level={3} style={{ textAlign: 'center' , marginTop: '30px', marginBottom: '30px'}}>临时凭证体验</Title>

    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px', marginBottom: '25px', marginLeft: '35px'}}>
    <Steps current={2} direction="horizontal" responsive={false} style={{ width: '100%' }}>
        <Step style={{ flex: 0.5 }} />
        <Step style={{ flex: 0.5 }} />
        <Step style={{ flex: 0.5 }} />
        <Step style={{ flex: 0.5 }} /> 
    </Steps>
    </div>

    <Divider>3. 使用STS Token获取现场照片</Divider>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
        {imageUrls.map((url, index) => (
          <div key={index} style={{ width: '47%', position: 'relative', paddingBottom: '1%' }}>
            {loading ? (
              <Spin style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
            ) : (
              <Image
                src={url}
                alt={`照片${index + 1}`}
                style={{
                  width: '170px',
                  height: '140px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  border: '1px solid #d9d9d9',
                }}
              />
            )}
          </div>
        ))}
      </div>

      <Button
        type="primary"
        onClick={handleNextBatch}
        style={{ width: '100%', marginBottom: '24px' }}
        disabled={loading}
        size='large'
      >
        换一批
      </Button>

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
          disabled={loading || imageUrls.length === 0}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default ThirdPage;
