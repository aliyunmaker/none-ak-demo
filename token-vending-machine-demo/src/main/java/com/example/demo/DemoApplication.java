
package com.example.demo;

import java.util.HashMap;
import java.util.Map;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.aliyun.credentials.utils.AuthConstant;
import com.aliyun.sts20150401.Client;
import com.aliyun.sts20150401.models.AssumeRoleRequest;
import com.aliyun.sts20150401.models.AssumeRoleResponse;
import com.aliyun.sts20150401.models.AssumeRoleResponseBody;
import com.aliyun.teaopenapi.models.Config;
import com.samskivert.mustache.Mustache;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class DemoApplication {

    // RAM角色的ARN
    // 格式：「acs:ram::${账号 ID}:role/${角色名称}」
    final String role = System.getenv("ROLE");

    final String bucket = System.getenv("BUCKET");

    final Long durationSeconds = 3600L;

    // OSS目录
    final String dir = System.getenv("DIR");

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @RequestMapping("/*")
    public String hello(@RequestHeader Map<String, String> headers,
                        @RequestParam(required = false) Map<String, String> params, @RequestBody(required = false) String body) {

        // 服务端部署在函数计算上，服务端不保存访问密钥
        // 从函数计算的上下文获取绑定的 RAM 角色的临时凭证信息
        // 使用临时凭证初始化 Credentials SDK
        com.aliyun.credentials.models.Config credentialsConfig = new com.aliyun.credentials.models.Config() {{
            type = AuthConstant.STS;
            accessKeyId = headers.get("x-fc-access-key-id");
            accessKeySecret = headers.get("x-fc-access-key-secret");
            securityToken = headers.get("x-fc-security-token");
        }};

        
        // 构造 STS 请求的 Client
        com.aliyun.credentials.Client credentialsClient = new com.aliyun.credentials.Client(credentialsConfig);        
        Config clientConfig = new Config().setRegionId("cn-hangzhou").setCredential(credentialsClient);

        try {
            Client stsClient = new Client(clientConfig);
            // 颁发 STS Token
            // 根据请求参数中的文件名称，限制只有下载指定文件的权限
            AssumeRoleResponseBody.AssumeRoleResponseBodyCredentials credentials = vendToken(null, role, stsClient);

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("Credentials", credentials);
            jsonObject.put("RequestId", requestId);
            return jsonObject.toJSONString();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public AssumeRoleResponseBody.AssumeRoleResponseBodyCredentials vendToken(String fileName, String role, Client stsClient) throws Exception {
        // 生成权限策略
        String sessionPolicy = generateOSSPolicy(fileName);
        // 获取 STS Token
        return getCredentials(sessionPolicy, role, stsClient);
    }

    /**
     * 生成权限策略
     * 权限策略模板：
        {
            "Version": "1",
            "Statement": [
                {
                "Effect": "Allow",
                "Action": ["oss:GetObject", "oss:PutObject"],
                "Resource": "acs:oss:*:*:{{bucket}}/{{dir}}/{{file}}"
                },
                {
                "Effect": "Allow",
                "Action": "oss:ListObjects",
                "Resource": "acs:oss:*:*:{{bucket}}",
                "Condition": {
                    "StringLike": {
                    "oss:Delimiter": "/",
                    "oss:Prefix": ["{{dir}}/*"]
                    }
                }
                }
            ]
        }
     */
    private String generateOSSPolicy(String fileName) {
        String policyTemplate = "{\n"
            + "  \"Version\": \"1\",\n"
            + "  \"Statement\": [\n"
            + "      {\n"
            + "          \"Effect\": \"Allow\",\n"
            + "          \"Action\": [\n"
            + "              \"oss:GetObject\",\n"
            + "              \"oss:PutObject\"\n"
            + "          ],\n"
            + "          \"Resource\": \"acs:oss:*:*:{{bucket}}/{{dir}}/{{file}}\"\n"
            + "      },\n"
            + "      {\n"
            + "          \"Effect\": \"Allow\",\n"
            + "          \"Action\": \"oss:ListObjects\",\n"
            + "          \"Resource\": \"acs:oss:*:*:{{bucket}}\",\n"
            + "          \"Condition\": {\n"
            + "              \"StringLike\": {\n"
            + "                  \"oss:Delimiter\": \"/\",\n"
            + "                  \"oss:Prefix\": [\n"
            + "                      \"{{dir}}/*\"\n"
            + "                  ]\n"
            + "              }\n"
            + "          }\n"
            + "      }\n"
            + "  ]\n"
            + "}";
        // 替换模版内容
        return Mustache.compiler().compile(policyTemplate).execute(new HashMap<String, String>() {{
            put("bucket", bucket);
            put("dir", dir);
            put("file", fileName == null ? "*" : fileName);
        }});
    }

    /**
     * 获取 STS Token
     */
    private AssumeRoleResponseBody.AssumeRoleResponseBodyCredentials getCredentials(String sessionPolicy, String role, Client stsClient) throws Exception {
        AssumeRoleRequest assumeRoleRequest = new AssumeRoleRequest()
            // 扮演的RAM角色ARN，acs:ram::${账号 ID}:role/${角色名称}
            .setRoleArn(role)
            // 设置角色会话名称
            .setRoleSessionName("NoneAkTvmDemo")
            // 设置会话权限策略
            .setPolicy(sessionPolicy)
            // 设置临时凭证有效时间，单位：秒
            .setDurationSeconds(durationSeconds);
        AssumeRoleResponse assumeRoleResponse = stsClient.assumeRole(assumeRoleRequest);
        return assumeRoleResponse.getBody().getCredentials();
    }
}