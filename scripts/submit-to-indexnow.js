const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

const API_KEY = '17a4110cedb34ae9aae6b7b16c03cef9';
const HOST = 'www.whycolors.com';
const BATCH_SIZE = 10000;
const SITE_URL = `https://${HOST}`;

console.log('🚀 IndexNow Submission Started');
console.log('================================');
console.log(`📌 Host: ${HOST}`);
console.log(`📌 API Key: ${API_KEY}`);
console.log(`📌 Site URL: ${SITE_URL}`);
console.log('================================\n');

// Track submitted URLs to avoid re-submitting
const SUBMITTED_LOG = path.join(process.cwd(), '.indexnow-submitted.json');

function loadSubmittedUrls() {
  try {
    if (fs.existsSync(SUBMITTED_LOG)) {
      const data = fs.readFileSync(SUBMITTED_LOG, 'utf8');
      return new Set(JSON.parse(data));
    }
  } catch (e) {
    console.warn('⚠️ Could not load submitted log, starting fresh');
  }
  return new Set();
}

function saveSubmittedUrls(submittedSet) {
  try {
    fs.writeFileSync(SUBMITTED_LOG, JSON.stringify([...submittedSet]), 'utf8');
  } catch (e) {
    console.error('❌ Failed to save submitted log:', e.message);
  }
}

async function fetchSitemap(url) {
  try {
    console.log(`📂 Fetching: ${url}`);
    const response = await axios.get(url, { 
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IndexNowBot/1.0)'
      }
    });
    
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.log(`⚠️ Could not fetch ${url}: ${error.message}`);
    return null;
  }
}

async function parseSitemapXml(xmlContent, url) {
  try {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlContent);
    
    // Check if it's a sitemap index
    if (result.sitemapindex && result.sitemapindex.sitemap) {
      console.log(`📑 Found sitemap index with ${result.sitemapindex.sitemap.length} sub-sitemaps`);
      const sitemapUrls = result.sitemapindex.sitemap.map(s => s.loc[0]);
      
      let allUrls = [];
      for (const subUrl of sitemapUrls) {
        console.log(`  📂 Fetching sub-sitemap: ${subUrl}`);
        const subXml = await fetchSitemap(subUrl);
        if (subXml) {
          const subUrls = await parseSitemapXml(subXml, subUrl);
          allUrls = allUrls.concat(subUrls);
        }
      }
      return allUrls;
    }
    
    // Regular sitemap
    if (result.urlset && result.urlset.url) {
      const urls = result.urlset.url.map(url => url.loc[0]);
      console.log(`✅ Found ${urls.length} URLs from ${url}`);
      return urls;
    }
    
    return [];
  } catch (error) {
    console.error(`❌ Error parsing sitemap XML:`, error.message);
    return [];
  }
}

async function getAllSitemapUrls() {
  // Try all possible sitemap URLs
  const sitemapUrls = [
    `${SITE_URL}/sitemap.xml`,
    `${SITE_URL}/sitemap-main.xml`,
    `${SITE_URL}/sitemap-colors.xml`,
    `${SITE_URL}/sitemap-palettes.xml`,
    `${SITE_URL}/sitemap-conversions.xml`,
  ];

  let allUrls = [];

  for (const sitemapUrl of sitemapUrls) {
    const xmlContent = await fetchSitemap(sitemapUrl);
    if (xmlContent) {
      const urls = await parseSitemapXml(xmlContent, sitemapUrl);
      if (urls.length > 0) {
        allUrls = allUrls.concat(urls);
      }
    }
  }

  return allUrls;
}

async function submitBatch(urls, batchNumber) {
  const payload = {
    host: HOST,
    key: API_KEY,
    keyLocation: `https://${HOST}/${API_KEY}.txt`,
    urlList: urls
  };

  console.log(`\n📦 Submitting Batch ${batchNumber}...`);
  console.log(`📊 URLs in batch: ${urls.length}`);
  
  try {
    const response = await axios.post(
      'https://api.indexnow.org/indexnow',
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );
    
    if (response.status === 200 || response.status === 202) {
      console.log(`✅ Batch ${batchNumber} - Status: ${response.status}`);
      return true;
    } else {
      console.log(`⚠️ Batch ${batchNumber} - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Batch ${batchNumber} failed:`, error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      if (error.response.status === 429) {
        console.log('   ⏳ Rate limited. Waiting 60 seconds...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        return submitBatch(urls, batchNumber); // Retry
      }
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function main() {
  console.log('🔍 Fetching sitemaps...');
  console.log('--------------------------------');
  
  // Get all URLs from sitemaps
  let allUrls = await getAllSitemapUrls();
  
  // If no URLs found, use fallback
  if (allUrls.length === 0) {
    console.log('\n⚠️ No URLs found in sitemaps. Using fallback URLs...');
    allUrls = [
      'https://www.whycolors.com/',
      'https://www.whycolors.com/colors',
      'https://www.whycolors.com/palettes',
      'https://www.whycolors.com/conversions',
    ];
    console.log(`📊 Using ${allUrls.length} fallback URLs`);
  }
  
  // Remove duplicates
  const uniqueUrls = [...new Set(allUrls)];
  console.log(`\n📊 Unique URLs found: ${uniqueUrls.length}`);
  
  if (uniqueUrls.length === 0) {
    console.log('❌ No URLs to submit');
    return;
  }
  
  // Load previously submitted URLs
  const submittedUrls = loadSubmittedUrls();
  console.log(`📊 Already submitted: ${submittedUrls.size}`);
  
  // Filter out already submitted URLs
  const remainingUrls = uniqueUrls.filter(url => !submittedUrls.has(url));
  console.log(`📊 Remaining to submit: ${remainingUrls.length}`);
  
  if (remainingUrls.length === 0) {
    console.log('✨ All URLs already submitted!');
    return;
  }
  
  // Submit in batches
  const totalBatches = Math.ceil(remainingUrls.length / BATCH_SIZE);
  console.log(`\n📦 Will submit ${totalBatches} batch(es)...`);
  
  let successCount = 0;
  let failedBatches = [];
  
  for (let i = 0; i < remainingUrls.length; i += BATCH_SIZE) {
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const batchUrls = remainingUrls.slice(i, i + BATCH_SIZE);
    
    const success = await submitBatch(batchUrls, batchNumber);
    
    if (success) {
      successCount++;
      // Add to submitted set
      batchUrls.forEach(url => submittedUrls.add(url));
      saveSubmittedUrls(submittedUrls);
    } else {
      failedBatches.push(batchNumber);
    }
    
    // Delay between batches
    if (i + BATCH_SIZE < remainingUrls.length) {
      console.log('⏳ Waiting 5 seconds before next batch...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Summary
  console.log('\n================================');
  console.log('✨ SUBMISSION SUMMARY');
  console.log('================================');
  console.log(`✅ Successful batches: ${successCount}/${totalBatches}`);
  console.log(`📊 Total URLs in log: ${submittedUrls.size}`);
  
  if (failedBatches.length > 0) {
    console.log(`\n⚠️ Failed batches: ${failedBatches.join(', ')}`);
    console.log('💡 Run the script again to retry failed batches');
  } else {
    console.log('\n🎉 All URLs successfully submitted to IndexNow!');
  }
  
  console.log('\n🔍 Verification:');
  console.log(`   Check Bing Webmaster Tools: https://www.bing.com/webmasters`);
  console.log(`   Key location: https://${HOST}/${API_KEY}.txt`);
  console.log(`   Sitemap location: ${SITE_URL}/sitemap.xml`);
}

// Run the script
main().catch(console.error);