"""OSS 文件删除工具（完整安全版 - 检查所有引用）"""
import json
import oss2
from sqlmodel import Session, select
from app.config import OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, OSS_BUCKET_NAME, OSS_ENDPOINT


def _get_bucket():
    """获取 OSS Bucket"""
    auth = oss2.Auth(OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET)
    return oss2.Bucket(auth, OSS_ENDPOINT, OSS_BUCKET_NAME)


def is_url_used_in_any_table(session: Session, url: str) -> bool:
    """
    检查 URL 是否被任何数据库表引用
    
    检查的表：
    - site_config.value (背景图、封面等配置)
    - photo.url (相册照片)
    - post.cover (文章封面)
    - album.cover (相册封面)
    - chatter.images (说说图片，JSON数组)
    - message.images (留言图片，JSON数组)
    """
    if not url:
        return False
    
    try:
        from app.models.site_config import SiteConfig
        from app.models.album import Photo, Album
        from app.models.post import Post
        from app.models.chatter import Chatter
        from app.models.message import Message
        
        # 1. 检查 site_config
        configs = session.exec(select(SiteConfig)).all()
        for config in configs:
            if url in str(config.value):
                print(f"[OSS] 跳过: 被配置 '{config.key}' 引用")
                return True
        
        # 2. 检查 photo.url
        photos = session.exec(select(Photo)).all()
        for photo in photos:
            if photo.url and url in photo.url:
                print(f"[OSS] 跳过: 被照片 ID={photo.id} 引用")
                return True
        
        # 3. 检查 post.cover
        posts = session.exec(select(Post)).all()
        for post in posts:
            if post.cover and url in post.cover:
                print(f"[OSS] 跳过: 被文章 ID={post.id} 引用")
                return True
        
        # 4. 检查 album.cover
        albums = session.exec(select(Album)).all()
        for album in albums:
            if album.cover and url in album.cover:
                print(f"[OSS] 跳过: 被相册 ID={album.id} 引用")
                return True
        
        # 5. 检查 chatter.images (JSON数组)
        chatters = session.exec(select(Chatter)).all()
        for chatter in chatters:
            if chatter.images:
                try:
                    images = json.loads(chatter.images)
                    if isinstance(images, list) and url in images:
                        print(f"[OSS] 跳过: 被说说 ID={chatter.id} 引用")
                        return True
                except:
                    pass
        
        # 6. 检查 message.images
        try:
            messages = session.exec(select(Message)).all()
            for msg in messages:
                if hasattr(msg, 'images') and msg.images:
                    try:
                        images = json.loads(msg.images)
                        if isinstance(images, list) and url in images:
                            print(f"[OSS] 跳过: 被留言 ID={msg.id} 引用")
                            return True
                    except:
                        pass
        except:
            pass
        
    except Exception as e:
        print(f"[OSS] 检查引用时出错: {e}")
    
    return False


def delete_oss_file(url: str, session: Session = None) -> bool:
    """根据 URL 删除 OSS 文件（安全版本）"""
    if not url or not url.startswith("http"):
        return False
    
    if session and is_url_used_in_any_table(session, url):
        return False
    
    try:
        parts = url.split("/")
        if len(parts) < 4:
            return False
        
        key = "/".join(parts[3:])
        
        bucket = _get_bucket()
        bucket.delete_object(key)
        print(f"[OSS] 已删除: {key}")
        return True
    except Exception as e:
        print(f"[OSS] 删除失败: {e}")
        return False


def delete_oss_files(urls: list, session: Session = None) -> int:
    """批量删除 OSS 文件（安全版本）"""
    count = 0
    for url in urls:
        if delete_oss_file(url, session):
            count += 1
    return count
