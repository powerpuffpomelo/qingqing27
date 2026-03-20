#!/usr/bin/env python3
"""
音频压缩脚本
将音频文件压缩为更小的文件以加快网站加载速度
"""

import subprocess
import os
import sys

def check_ffmpeg():
    """检查ffmpeg是否安装"""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def compress_audio(input_file, output_file, bitrate='96k'):
    """
    压缩音频文件
    
    参数:
        input_file: 输入文件路径
        output_file: 输出文件路径
        bitrate: 音频比特率 (默认96k，可选: 64k, 96k, 128k)
    """
    if not os.path.exists(input_file):
        print(f"错误: 找不到文件 {input_file}")
        return False
    
    if not check_ffmpeg():
        print("错误: 未安装 ffmpeg")
        print("\n请安装 ffmpeg:")
        print("  macOS: brew install ffmpeg")
        print("  Ubuntu/Debian: sudo apt-get install ffmpeg")
        print("  Windows: 从 https://ffmpeg.org/download.html 下载")
        return False
    
    print(f"正在压缩音频文件...")
    print(f"输入: {input_file}")
    print(f"输出: {output_file}")
    print(f"比特率: {bitrate}")
    
    # 获取原文件大小
    original_size = os.path.getsize(input_file) / (1024 * 1024)
    print(f"原始大小: {original_size:.2f} MB")
    
    try:
        # 使用ffmpeg压缩音频
        # -i: 输入文件
        # -b:a: 音频比特率
        # -ac: 声道数 (2 = 立体声)
        # -ar: 采样率 (44100 Hz)
        # -y: 覆盖输出文件
        cmd = [
            'ffmpeg',
            '-i', input_file,
            '-b:a', bitrate,
            '-ac', '2',
            '-ar', '44100',
            '-y',
            output_file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            compressed_size = os.path.getsize(output_file) / (1024 * 1024)
            compression_ratio = (1 - compressed_size / original_size) * 100
            
            print(f"\n✓ 压缩成功!")
            print(f"压缩后大小: {compressed_size:.2f} MB")
            print(f"压缩率: {compression_ratio:.1f}%")
            print(f"节省空间: {original_size - compressed_size:.2f} MB")
            return True
        else:
            print(f"\n✗ 压缩失败:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"\n✗ 发生错误: {e}")
        return False

if __name__ == '__main__':
    input_file = 'music/因为喜欢你.m4a'
    output_file = 'music/因为喜欢你_compressed.m4a'
    
    # 可以调整比特率: 64k (更小), 96k (平衡), 128k (更好质量)
    compress_audio(input_file, output_file, bitrate='96k')
