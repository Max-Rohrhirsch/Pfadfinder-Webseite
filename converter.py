#(?<=<div class="teaser-text" itemprop="description">)[\s\S]*?(?=<\/div>)
from glob import glob
import os
import re
import urllib.request
import sys

def getContent(idx, str):
    ret = ""
    idx -= 1
    while str[idx] != ">":
        ret = str[idx] + ret
        idx -= 1
    return ret

PTH = "../articles/*.html"
filenames = glob(PTH)
# filenames = ["../articles/dpv-go1ld.html"]

for filename in filenames:
    short_filename = filename.split('\\')[-1].split('.')[0]
    # short_filename = "dpv-gold"
    with open(filename, "r") as file:
        content = ''.join(list(file)).replace("\t", "")

        # extract title
        ext_title = re.search(r"(?<=<title>).*?(?=<\/title>)", content).group()

        # extract date
        ext_date = re.search(r"(\d{2}\/\d{2}\/\d{4})(?=(?:\n|\r|\r\n)?\t*<\/time>)", content).group()
        month, day, year = ext_date.split("/")
        ext_date = f"{day}/{month}/{year}"

        # extract author
        ext_author = ""
        if "<!-- author -->" in content:
            ext_author = ", created by "
            ext_author += re.search(r'(?<=Created by <span itemprop="name">).*?(?=<\/span>)', content).group()

        # extract teaser
        ext_teaser = ""
        if "<!-- teaser -->" in content:
            ext_teaser = re.search(r'(?<=<!-- teaser --><div class="teaser-text" itemprop="description">)[\s\S]*?(?=<\/div>)', content).group()

        # extract main
        if "<!-- teaser -->" in content:
            idx = content.index(ext_teaser)
            content = content[idx:]
        else:
            idx = content.index("</time>")
            content = content[idx:]
            idx = content.index("<!--")
            content = content[idx:]
        idx = content.index("<div")
        content = content[idx:]
        idx = content.index("<!-- Link Back -->")
        ext_main = content[:idx].replace("<!-- main text -->", "")

        # extract related
        content = content[idx:]
        ext_related = re.search(r'(?<=<!-- related things -->)[\s\S]*(?=(?:<\/div>){3}(?:\n|\r|\r\n))', content).group()
        ext_related = ext_related.replace("\t", "").replace("\n", "")
        for size in re.findall(r'\d+ \w{2}', ext_related):
            ext_related = ext_related.replace(size, f' {size}')

    # print(ext_title)
    # print(ext_date)
    # print(ext_author)
    # print(ext_teaser)
    # print(ext_main)
    # print(ext_related)

    # img urls
    ext_main = re.sub(r'<a href="\S+\.\w{3}" title="\S*" class="\S*" rel="\S*">', '', ext_main)
    ext_main = ext_main.replace('alt="" /></a>', 'alt="" />')
    ext_main = ext_main.replace('<img', '<img onclick="onImgClick(this)"')
    img_sources = [x[5:-1] for x in re.findall(r'src="\S+"', ext_main)]
    for src in img_sources:
        ext_main = ext_main.replace(src, f"/aktionen/{year}/{short_filename}/images/{src.split('/')[-1]}")

    # file urls
    file_sources = [x[6:-1] for x in re.findall(r'href="\S+"', ext_related)]
    for src in file_sources:
        ext_related = ext_related.replace(src, f"/aktionen/{year}/{short_filename}/files/{src.split('/')[-1]}")

    new_content =  ''.join([f'<html>\n',
                            f'<head>\n',
                                f'\t<title>{ext_title}</title>\n',
                                f'\t<link rel="icon" href="/bilder/favicon.png" type="image/x-icon"/>\n',
                                f'\t<link rel="stylesheet" href="/style.css"/>\n',
                                f'\t<script src="/script.js"></script>\n',
                                f'\t<link href="https://fonts.googleapis.com/css?family=Arimo" rel="stylesheet">\n',
                                f'\t<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">\n',
                                f'\t<script src="https://kit.fontawesome.com/a076d05399.js"></script>\n',
                            f'</head>\n',
                            f'<body>\n',
                                f'\t<%- include("../../../components/modals") %>\n',
                                 '\t<%- include("../../../components/navbar", {redirect: "/aktionen/' + year + '/' + short_filename + '"}) %>\n',
                                f'\t<div class="txt blocksatz noFooter">\n',
                                    f'\t\t<!-- title -->\n',
                                    f'\t\t<h2>{ext_title}</h2>\n',
                                    f'\t\t<!-- date, author -->\n',
                                    f'\t\t<h6>{ext_date + ext_author}</h6>\n',
                                    f'\t\t<!-- teaser -->\n',
                                    f'\t\t{ext_teaser}\n',
                                    f'\t\t<!-- main text -->\n',
                                    f'\t\t{ext_main}\n',
                                    f'\t\t{ext_related}\n',
                                f'\t</div>\n',
                                '\t<%- include("../../../components/footer") %>\n',
                            '</body>\n',
                            '</html>'])

    # print(new_content)
    # sys.exit(0)
    # year folder
    if not os.path.isdir("./views/aktionen/" + year + "/"):
        os.mkdir("./views/aktionen/" + year)

    # html
    os.mkdir(f"./views/aktionen/{year}/{short_filename}")
    with open(f"./views/aktionen/{year}/{short_filename}/{short_filename}.ejs", "w") as file:
        file.write(new_content)

    # images
    if "src=" in ext_main:
        os.mkdir(f"./views/aktionen/{year}/{short_filename}/images")
        img_sources = ["https://pfadis.org" + x for x in img_sources]
        for src in img_sources:
            img_name = src.split("/")[-1]
            with urllib.request.urlopen(src) as response, open(f"./views/aktionen/{year}/{short_filename}/images/{img_name}", "wb") as out_file:
                out_file.write(response.read())

    # files
    if "href=" in ext_related:
        os.mkdir(f"./views/aktionen/{year}/{short_filename}/files")
        file_sources = ["https://pfadis.org" + x for x in file_sources]
        for src in file_sources:
            file_name = src.split("/")[-1]
            with urllib.request.urlopen(src) as response, open(f"./views/aktionen/{year}/{short_filename}/files/{file_name}", "wb") as out_file:
                out_file.write(response.read())
