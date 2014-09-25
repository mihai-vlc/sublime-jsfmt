import subprocess
import sublime, sublime_plugin
import os

# jsfmt must be installed as a global npm module
BINARY_PATH = 'jsfmt'

class FormatJavascript(sublime_plugin.TextCommand):
  def run(self, edit):
    if self.view.size() > 0 and self.view.file_name().endswith(".js"):
      try:
        region = sublime.Region(0, self.view.size())
        content = self.view.substr(region)

        p = subprocess.Popen(BINARY_PATH, shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = p.communicate(content.encode('utf-8'))

        if stderr:
          print(stderr.decode('utf-8'))
        elif stdout:
          self.view.replace(edit, region, stdout.decode('utf-8'))

      finally:
        self.view.end_edit(edit)

class CommandOnSave(sublime_plugin.EventListener):
  def on_pre_save(self, view):
    view.run_command("format_javascript")