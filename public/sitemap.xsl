<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>XML Sitemap - BNKhub</title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<style type="text/css">
					body {
						font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
						font-size: 14px;
						color: #e2e8f0;
						background-color: #020617;
						margin: 0;
						padding: 40px;
					}
					a {
						color: #38bdf8;
						text-decoration: none;
					}
					a:hover {
						text-decoration: underline;
					}
					.container {
						max-width: 1000px;
						margin: 0 auto;
						background: #0f172a;
						padding: 40px;
						border-radius: 24px;
						box-shadow: 0 20px 50px rgba(0,0,0,0.5);
						border: 1px solid rgba(255,255,255,0.05);
					}
					h1 {
						font-size: 32px;
						margin-bottom: 10px;
						color: #f8fafc;
						background: linear-gradient(to right, #38bdf8, #818cf8);
						-webkit-background-clip: text;
						-webkit-text-fill-color: transparent;
					}
					p {
						color: #94a3b8;
						margin-bottom: 30px;
					}
					table {
						width: 100%;
						border-collapse: collapse;
						margin-top: 20px;
					}
					th {
						text-align: left;
						padding: 15px;
						background: rgba(255,255,255,0.02);
						color: #94a3b8;
						font-weight: 600;
						border-bottom: 2px solid rgba(255,255,255,0.05);
					}
					td {
						padding: 15px;
						border-bottom: 1px solid rgba(255,255,255,0.05);
					}
					tr:hover td {
						background: rgba(255,255,255,0.02);
					}
					.priority {
						display: inline-block;
						padding: 4px 10px;
						border-radius: 20px;
						font-size: 12px;
						font-weight: bold;
						background: #1e293b;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h1>BNKhub Sitemap</h1>
					<p>خريطة الموقع التقنية لمحركات البحث. تم ترتيب الصفحات حسب الأولوية.</p>
					<table>
						<thead>
							<tr>
								<th>URL</th>
								<th>Priority</th>
								<th>Change Freq.</th>
							</tr>
						</thead>
						<tbody>
							<xsl:for-each select="sitemap:urlset/sitemap:url">
								<tr>
									<td>
										<a href="{sitemap:loc}">
											<xsl:value-of select="sitemap:loc"/>
										</a>
									</td>
									<td>
										<span class="priority">
											<xsl:value-of select="sitemap:priority"/>
										</span>
									</td>
									<td>
										<xsl:value-of select="sitemap:changefreq"/>
									</td>
								</tr>
							</xsl:for-each>
						</tbody>
					</table>
				</div>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
