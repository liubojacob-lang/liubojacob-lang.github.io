/**
 * 图片优化脚本
 * 自动压缩和转换图片为WebP格式
 */

const fs = require('fs');
const path = require('path');

// 检查是否安装了sharp
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ 未安装sharp库');
  console.log('请运行: npm install sharp');
  process.exit(1);
}

const imagesDir = path.join(__dirname, 'source', 'images');
const outputDir = path.join(__dirname, 'source', 'images');

// 目标大小：800KB以内
const TARGET_SIZE = 800 * 1024; // 800KB
const MAX_WIDTH = 1920; // 最大宽度
const MAX_HEIGHT = 1080; // 最大高度

// 需要优化的图片列表（超过1MB的）
const largeImages = [
  'ai-from-elective-to-essential.jpg',           // 5.0MB
  '2026-ai-core-capabilities-blueprint.png',     // 3.1MB
  'banner1.png',                                  // 2.1MB
  'Building Intelligent AI Applications.png',    // 1.9MB
  'ai-agent-paradigm-shift.png',                 // 1.9MB
  'Claude-Code.png',                              // 1.9MB
  'ai-agent-framework.jpg',                      // 1.9MB
  'micro-frontend-architecture.png',             // 1.7MB
  'machine-learning-basics.png',                 // 1.7MB
  'typescript-advanced-guide.png',               // 1.7MB
  'frontend-performance-optimization.jpg',       // 1.6MB
  'homepage-banner.png',                         // 1.1MB
];

async function optimizeImage(imagePath) {
  const filename = path.basename(imagePath);
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);

  console.log(`\n📸 处理: ${filename}`);

  try {
    // 获取原始图片信息
    const metadata = await sharp(imagePath).metadata();
    const originalSize = fs.statSync(imagePath).size;

    console.log(`   原始大小: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   原始尺寸: ${metadata.width}x${metadata.height}`);

    // 计算新的尺寸（保持宽高比）
    let width = metadata.width;
    let height = metadata.height;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const widthRatio = MAX_WIDTH / width;
      const heightRatio = MAX_HEIGHT / height;
      const ratio = Math.min(widthRatio, heightRatio);

      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      console.log(`   调整尺寸为: ${width}x${height}`);
    }

    // 输出文件路径
    const outputPath = path.join(outputDir, `${basename}.webp`);

    // 逐步降低质量直到满足目标大小
    let quality = 85;
    let optimizedSize = originalSize;

    while (quality > 50 && optimizedSize > TARGET_SIZE) {
      const buffer = await sharp(imagePath)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: quality })
        .toBuffer();

      optimizedSize = buffer.length;

      if (optimizedSize > TARGET_SIZE) {
        quality -= 5;
      } else {
        // 保存优化后的图片
        fs.writeFileSync(outputPath, buffer);
        break;
      }
    }

    const savedPercent = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

    console.log(`   ✅ 优化成功!`);
    console.log(`   输出文件: ${path.basename(outputPath)}`);
    console.log(`   优化后大小: ${(optimizedSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   节省空间: ${savedPercent}%`);
    console.log(`   质量: ${quality}`);

    // 更新markdown文件中的图片引用
    updateMarkdownReferences(filename, `${basename}.webp`);

  } catch (error) {
    console.error(`   ❌ 处理失败: ${error.message}`);
  }
}

function updateMarkdownReferences(oldImage, newImage) {
  const postsDir = path.join(__dirname, 'source', '_posts');

  if (!fs.existsSync(postsDir)) {
    return;
  }

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  files.forEach(file => {
    const filePath = path.join(postsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // 替换图片引用
    if (content.includes(oldImage)) {
      content = content.replace(new RegExp(oldImage, 'g'), newImage);
      fs.writeFileSync(filePath, content);
      updated = true;
      console.log(`   📝 更新引用: ${file}`);
    }
  });
}

async function main() {
  console.log('🚀 开始图片优化...\n');
  console.log(`目标: 压缩至${TARGET_SIZE / 1024}KB以内，转换为WebP格式\n`);

  let processed = 0;
  let totalSaved = 0;

  for (const image of largeImages) {
    const imagePath = path.join(imagesDir, image);

    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  跳过（文件不存在）: ${image}`);
      continue;
    }

    const originalSize = fs.statSync(imagePath).size;

    await optimizeImage(imagePath);

    const webpPath = imagePath.replace(path.extname(image), '.webp');
    if (fs.existsSync(webpPath)) {
      const newSize = fs.statSync(webpPath).size;
      totalSaved += (originalSize - newSize);
      processed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 优化完成！`);
  console.log(`   处理图片: ${processed}/${largeImages.length}`);
  console.log(`   总共节省: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
  console.log('='.repeat(50));

  console.log('\n📌 后续步骤:');
  console.log('1. 检查生成的WebP图片');
  console.log('2. 运行 hexo clean && hexo g 重新生成站点');
  console.log('3. 测试页面加载速度');
}

main().catch(console.error);
