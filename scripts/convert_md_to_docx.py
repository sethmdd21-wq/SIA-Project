#!/usr/bin/env python3
"""
Convert docs/SIA-Project-Full-Documentation.md to docs/SIA-Project-Full-Documentation.docx.
Attempts pandoc, pypandoc, then markdown->html->html2docx fallback.
"""

from __future__ import annotations
import os
import sys
import shutil
import subprocess


def abs_path(*parts):
    return os.path.normpath(os.path.join(*parts))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD = abs_path(ROOT, 'docs', 'SIA-Project-Full-Documentation.md')
OUT = abs_path(ROOT, 'docs', 'SIA-Project-Full-Documentation.docx')


def convert_with_pandoc(md, out):
    if shutil.which('pandoc') is None:
        print('pandoc not found on PATH')
        return False
    cmd = ['pandoc', md, '-f', 'markdown', '-t', 'docx', '-o', out]
    try:
        subprocess.check_call(cmd)
        print('Converted with pandoc:', out)
        return True
    except subprocess.CalledProcessError as e:
        print('pandoc failed:', e)
        return False


def convert_with_pypandoc(md, out):
    try:
        import pypandoc
    except Exception as e:
        print('pypandoc import failed:', e)
        return False
    try:
        pypandoc.convert_file(md, 'docx', outputfile=out)
        print('Converted with pypandoc:', out)
        return True
    except Exception as e:
        print('pypandoc conversion failed:', e)
        return False


def convert_with_html2docx(md, out):
    try:
        from markdown import markdown
        from html2docx import html2docx
    except Exception as e:
        print('html2docx or markdown not available:', e)
        return False
    try:
        with open(md, 'r', encoding='utf-8') as f:
            text = f.read()
        html = markdown(text, extensions=['fenced_code','tables','attr_list'])
        html2docx(html, out)
        print('Converted with html2docx:', out)
        return True
    except Exception as e:
        print('html2docx conversion failed:', e)
        return False


def main():
    if not os.path.exists(MD):
        print('Source markdown not found:', MD)
        return 2
    for fn in (convert_with_pandoc, convert_with_pypandoc, convert_with_html2docx):
        try:
            ok = fn(MD, OUT)
            if ok:
                return 0
        except Exception as e:
            print('Error during conversion attempt:', e)
    print('All methods failed. Install pandoc or required Python packages:')
    print('  pip install pypandoc markdown html2docx python-docx')
    return 1


if __name__ == '__main__':
    sys.exit(main())
