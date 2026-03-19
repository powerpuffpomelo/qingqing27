#!/usr/bin/env python3
"""
图片压缩脚本 - 增强版本
"""

import os
from pathlib import Path
from PIL import Image
import shutil

# 配置
BASE_DIR = Path("/Users/yimingyan/project/qingqing27")
SOURCE_DIR = BASE_DIR / "images_ori"  # 原始图片目录
TARGET_DIR = BASE_DIR / "images"      # 压缩后图片目录
MAX_WIDTH = 1920  # 最大宽度
MAX_HEIGHT = 1920  # 最大高度
MAX_FILE_SIZE = 200 * 1024  # 200KB (字节)
MAX_ATTEMPTS = 5  # 最大压缩尝试次数
INITIAL_QUALITY = 80  # 初始JPG质量
MIN_QUALITY = 50  # 最低JPG质量
PNG_OPTIMIZE = True  # PNG优化

def ensure_directory_structure(source_path, target_dir):
    """确保目标目录结构与源目录一致"""
    # 计算相对于SOURCE_DIR的相对路径
    relative_path = source_path.relative_to(SOURCE_DIR)
    # 构建对应的目标目录路径
    target_subdir = target_dir / relative_path.parent
    target_subdir.mkdir(parents=True, exist_ok=True)
    return target_subdir

def compress_to_target_size(source_path, target_path, max_size=MAX_FILE_SIZE, max_attempts=MAX_ATTEMPTS):
    """压缩图片到目标大小以下，支持多次尝试"""
    try:
        with Image.open(source_path) as img:
            original_format = img.format
            original_mode = img.mode
            
            # 转换RGBA到RGB（如果是PNG且需要转JPG）
            if img.mode in ('RGBA', 'LA', 'P'):
                if img.mode == 'P':
                    img = img.convert('RGBA')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # 调整大小（如果超过最大尺寸）
            if img.width > MAX_WIDTH or img.height > MAX_HEIGHT:
                img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
                print(f"  调整尺寸: {img.width}x{img.height}")
            
            # 多轮压缩尝试
            current_quality = INITIAL_QUALITY
            quality_step = (INITIAL_QUALITY - MIN_QUALITY) // max_attempts
            
            # 添加标志位，记录PNG是否已经转换为JPG
            png_converted_to_jpg = False
            
            for attempt in range(max_attempts):
                # 保存压缩后的图片
                # if source_path.suffix.lower() in ['.png']:
                #     img.save(target_path, 'PNG', optimize=PNG_OPTIMIZE, quality=95)
                if source_path.suffix.lower() in ['.png'] and not png_converted_to_jpg:
                    # PNG格式，使用更激进的压缩
                    img.save(target_path, 'PNG', optimize=True)
                    # 如果仍然太大，考虑转换为JPEG（只在第一次尝试时执行）
                    compressed_size = os.path.getsize(target_path)
                    if compressed_size > MAX_FILE_SIZE:
                        print(f"  PNG仍然过大，转换为JPEG格式")
                        # 如果有透明通道，转换为RGB
                        if img.mode in ('RGBA', 'LA', 'P'):
                            background = Image.new('RGB', img.size, (255, 255, 255))
                            if img.mode == 'P':
                                img = img.convert('RGBA')
                            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                            img = background
                        else:
                            img = img.convert('RGB')
                        # 保存为JPEG并应用质量设置
                        target_path_jpg = target_path.with_suffix('.jpg')
                        img.save(target_path_jpg, 'JPEG', quality=current_quality, optimize=True)
                        # 删除原PNG文件，使用JPG文件
                        if target_path.exists():
                            target_path.unlink()
                        target_path = target_path_jpg
                        png_converted_to_jpg = True  # 标记已经转换
                    else:
                        # PNG压缩成功，直接返回
                        return True, compressed_size, current_quality
                elif source_path.suffix.lower() in ['.png'] and png_converted_to_jpg:
                    # PNG已经转换为JPG，按JPG处理
                    img.save(target_path, 'JPEG', quality=current_quality, optimize=True)
                elif source_path.suffix.lower() in ['.jpg', '.jpeg']:
                    img.save(target_path, 'JPEG', quality=current_quality, optimize=True)
                
                # 检查文件大小
                compressed_size = os.path.getsize(target_path)
                
                if compressed_size <= max_size:
                    # 达到目标大小
                    return True, compressed_size, current_quality
                else:
                    # 未达到目标大小，降低质量继续尝试
                    if current_quality > MIN_QUALITY:
                        current_quality = max(MIN_QUALITY, current_quality - quality_step)
                        print(f"  第{attempt + 1}次尝试: {compressed_size/1024:.1f}KB > {max_size/1024:.1f}KB, 质量降至{current_quality}")
                    else:
                        # 已经是最低质量，仍然大于目标大小
                        print(f"  警告: 无法压缩到目标大小，当前 {compressed_size/1024:.1f}KB")
                        return False, compressed_size, current_quality
            
            # 所有尝试都失败
            return False, compressed_size, current_quality
            
    except Exception as e:
        print(f"  压缩失败: {e}")
        return False, 0, 0

def compress_image(source_path, target_path):
    """压缩单个图片"""
    try:
        # 检查源文件是否存在且有读取权限
        if not source_path.exists():
            print(f"✗ 源文件不存在: {source_path}")
            return False
        
        if not os.access(source_path, os.R_OK):
            print(f"✗ 无读取权限: {source_path.name}")
            return False
        
        # 获取原始文件大小
        original_size = os.path.getsize(source_path)
        
        print(f"处理: {source_path.name} ({original_size/1024:.1f}KB)")
        
        # 如果原始文件已经小于目标大小，直接复制
        if original_size <= MAX_FILE_SIZE:
            shutil.copy2(source_path, target_path)
            print(f"  ✓ 已复制 (原文件已小于{MAX_FILE_SIZE/1024}KB)")
            return True
        
        # 压缩到目标大小
        success, compressed_size, final_quality = compress_to_target_size(source_path, target_path)
        
        if success:
            reduction = (1 - compressed_size / original_size) * 100
            print(f"  ✓ 压缩成功: {original_size/1024:.1f}KB → {compressed_size/1024:.1f}KB (质量:{final_quality}, 减少{reduction:.1f}%)")
            return True
        else:
            # 压缩失败或无法达到目标大小，但仍然保存结果
            if compressed_size > 0:
                reduction = (1 - compressed_size / original_size) * 100
                print(f"  ⚠ 部分压缩: {original_size/1024:.1f}KB → {compressed_size/1024:.1f}KB (质量:{final_quality}, 减少{reduction:.1f}%)")
                return True
            else:
                # 完全失败，复制原文件
                shutil.copy2(source_path, target_path)
                print(f"  ✗ 压缩失败，已复制原文件")
                return False
            
    except Exception as e:
        print(f"✗ 处理失败 {source_path.name}: {e}")
        # 出错时尝试复制原文件
        try:
            shutil.copy2(source_path, target_path)
            print(f"  ⚠ 出错，已复制原文件")
        except:
            pass
        return False

def main():
    print("=" * 60)
    print("图片压缩工具 - 增强版本")
    print(f"源目录: {SOURCE_DIR}")
    print(f"目标目录: {TARGET_DIR}")
    print(f"目标大小: {MAX_FILE_SIZE/1024}KB")
    print("=" * 60)
    
    # 检查源目录
    if not SOURCE_DIR.exists():
        print(f"错误: 源目录不存在 {SOURCE_DIR}")
        return
    
    # 删除并重建目标目录
    if TARGET_DIR.exists():
        print(f"删除现有目标目录: {TARGET_DIR}")
        shutil.rmtree(TARGET_DIR)
    
    # 确保目标目录存在
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    
    # 查找所有图片
    image_files = []
    for ext in ['*.png', '*.jpg', '*.jpeg', '*.PNG', '*.JPG', '*.JPEG']:
        image_files.extend(SOURCE_DIR.rglob(ext))
    
    print(f"找到 {len(image_files)} 个图片文件")
    print("开始压缩...\n")
    
    # 压缩图片
    processed_count = 0
    compressed_count = 0
    copied_count = 0
    failed_count = 0
    total_original = 0
    total_compressed = 0
    
    for source_path in image_files:
        # 确保目标目录结构
        target_subdir = ensure_directory_structure(source_path, TARGET_DIR)
        target_path = target_subdir / source_path.name
        
        original_size = os.path.getsize(source_path)
        total_original += original_size
        
        # 压缩图片
        if compress_image(source_path, target_path):
            processed_count += 1
            # 重新获取最终的目标文件路径（因为PNG可能被转换为JPG）
            final_target_path = target_path
            if source_path.suffix.lower() == '.png' and not target_path.exists():
                # 如果PNG文件被转换为JPG，检查JPG文件是否存在
                jpg_path = target_path.with_suffix('.jpg')
                if jpg_path.exists():
                    final_target_path = jpg_path
            
            compressed_size = os.path.getsize(final_target_path)
            total_compressed += compressed_size
            
            if compressed_size < original_size:
                compressed_count += 1
            else:
                copied_count += 1
        else:
            failed_count += 1
            # 失败时统计目标文件大小（可能是复制的原文件）
            if target_path.exists():
                total_compressed += os.path.getsize(target_path)
    
    # 统计
    print("\n" + "=" * 60)
    print("压缩完成！")
    print(f"总文件数: {len(image_files)}")
    print(f"成功处理: {processed_count}")
    print(f"  - 压缩优化: {compressed_count}")
    print(f"  - 直接复制: {copied_count}")
    print(f"处理失败: {failed_count}")
    
    if total_original > 0:
        print(f"总大小: {total_original / 1024 / 1024:.1f}MB → {total_compressed / 1024 / 1024:.1f}MB")
        print(f"节省空间: {(1 - total_compressed / total_original) * 100:.1f}%")
    
    # 检查超过200KB的文件
    oversized_files = []
    for target_path in TARGET_DIR.rglob('*'):
        if target_path.is_file() and target_path.suffix.lower() in ['.png', '.jpg', '.jpeg']:
            if os.path.getsize(target_path) > MAX_FILE_SIZE:
                oversized_files.append(target_path)
    
    if oversized_files:
        print(f"\n警告: 仍有 {len(oversized_files)} 个文件超过{MAX_FILE_SIZE/1024}KB:")
        for f in oversized_files:
            size_kb = os.path.getsize(f) / 1024
            print(f"  - {f.relative_to(TARGET_DIR)} ({size_kb:.1f}KB)")
    
    print("=" * 60)

if __name__ == "__main__":
    main()

# python3 compress_images.py > compress.log 2>&1
