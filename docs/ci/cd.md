<!--
 * @Author       : Z2-WIN\xmm wujixmm@gmail.com
 * @Date         : 2025-12-24 11:02:57
 * @LastEditors  : Z2-WIN\xmm wujixmm@gmail.com
 * @LastEditTime : 2025-12-24 14:21:26
 * @FilePath     : \ex1c:\Users\xmm\studioProjects\flutter_ex1_back\docs\ci\cd.md
 * @Description  : 自动化部署
-->

pm2
docker / mysql

1. 部署mysql容器

```bash
docker run -d --name docker-mysql1 \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=ex1 \
  -e MYSQL_USER=ex1 \
  -e MYSQL_PASSWORD=123456 \
  -p 3306:3306 \
  mysql:8.0.42
```

2. 启动mysql容器

```bash
docker start  docker-mysql1
```

docker / nginx

1. 部署nginx容器

```bash
docker run -d \
  --name nginx1 \
  -p 8080:80 \
  # 挂载主配置文件
  -v ~/Sites/nginx/nginx.conf:/etc/nginx/nginx.conf \
  # 挂载虚拟主机配置目录
  -v ~/Sites/nginx/conf.d:/etc/nginx/conf.d \
  # 保留原有网页目录挂载
  -v ~/Sites/html:/usr/share/nginx/html \
  # 可选：挂载日志目录（方便查看日志）
  -v ~/Sites/nginx/logs:/var/log/nginx \
  nginx
```

2. 启动nginx容器

```bash
docker start  nginx1
```

3. 容器自动启动

```bash
docker update docker-mysql1 --restart unless-stopped
docker update nginx1 --restart unless-stopped
```

auto deploy
