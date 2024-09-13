import { Button, Divider, message, Popover, Spin, Steps, Table, Typography } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from './TokenContext';

const { Title } = Typography;
const { Step } = Steps;

const FirstPage: React.FC = () => {
  const { tokenData, setTokenData, setRequestId } = useToken();
  const [data, setData] = React.useState(tokenData);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const convertToLocalTime = (utcTime: string) => {
    const date = new Date(utcTime);
    return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  };

  const truncateText = (text: string, maxLength: number = 18) => {
    if (!text) {
        return '---';
    }
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  };

  function maskToken(str: string) {
    if (str.length <= 8) {
        return '*'.repeat(str.length);
    }
    return str.slice(0, 5) + '*'.repeat(8) + str.slice(13);
}
  
  const renderPopoverContent = (text: string) => (
    <div style={{ maxWidth: '200px', maxHeight: '150px', overflowY: 'auto', wordBreak: 'break-word' }}>
      {text}
    </div>
  );

  const columns = [
    {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (text: string) => (
        <Popover content={renderPopoverContent(text)}>
          <span>{truncateText(text)}</span>
        </Popover>
      ),
    },
  ];

  const fetchToken = async () => {
    setLoading(true);

    try {
        const resp = await fetch('https://none-ak-demo-wizqdhofvk.cn-hangzhou.fcapp.run');
        if(!resp.ok) {
            throw new Error('Failed to fetch token data');
        }

        const data = await resp.json();
        
        data.Credentials.expiration = convertToLocalTime(data.Credentials.expiration);
        setData(data.Credentials);
        setTokenData(data.Credentials);
        setRequestId(data.RequestId);
        message.success('STS Token 获取成功!');
    } catch (error) {
        message.error('Failed to fetch token data, please try again.');
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const dataSource = [
    {
      key: '1',
      field: 'AccessKeyId',
      value: data?.accessKeyId || null,
    },
    {
      key: '2',
      field: 'AccessKeySecret',
      value: maskToken(data?.accessKeySecret || '') || null,
    },
    {
      key: '3',
      field: 'SecurityToken',
      value: maskToken(data?.securityToken || '') || null,
    },
    {
      key: '4',
      field: 'Expiration',
      value: data?.expiration || null,
    },
  ];

  const nextStep = () => {
    if (data) {
      navigate('/second');
    } else {
      message.error('请先获取STS Token.');
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: '375px', margin: '0 auto' }}>
      <Title level={3} style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px'}}>临时凭证体验</Title>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px', marginBottom: '25px', marginLeft: '35px'}}>
        <Steps current={0} direction="horizontal" responsive={false} style={{ width: '100%' }}>
          <Step style={{ flex: 0.5 }} />
          <Step style={{ flex: 0.5 }} />
          <Step style={{ flex: 0.5 }} />
          <Step style={{ flex: 0.5 }} /> 
        </Steps>
      </div>

      <Divider>1. 获取STS Token</Divider>

      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={dataSource} 
          pagination={false} 
          bordered 
          style={{ marginBottom: '24px' }} 
          showHeader={false}
        />
      </Spin>
      <Button 
        type="primary" 
        onClick={fetchToken} 
        style={{ width: '100%', marginBottom: '24px' }}
        disabled={loading}
        size="large"
      >
        获取STS Token
      </Button>
      <Button 
        type="primary" 
        onClick={nextStep} 
        disabled={!data || loading}
        style={{ width: '100%' }}
      >
        下一步
      </Button>
    </div>
  );
};

export default FirstPage;
