import subprocess
import sublime, sublime_plugin
import os

# jsfmt must be installed as a global npm module

class FormatJavascript(sublime_plugin.TextCommand):
  def run(self, edit):
    if self.view.size() > 0 and self.view.file_name().endswith(".js"):
      try:

        file_name = self.view.file_name()
        fileExt = os.path.splitext(file_name)
        file = fileExt[0]
        ext = fileExt[1]
        path = os.path.dirname(file)
        file = os.path.basename(file)

        region = sublime.Region(0, self.view.size())
        content = self.view.substr(region)

        p = subprocess.Popen('jsfmt "' + file_name + '"',
          cwd=path, shell=True,
          stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = p.communicate()

        if stderr:
          print(stderr.decode('utf-8'))
        elif stdout:
          self.view.replace(edit, region, stdout.decode('utf-8'))

      finally:
        self.view.end_edit(edit)

class CommandOnSave(sublime_plugin.EventListener):
  def on_pre_save(self, view):
    view.run_command("format_javascript")
