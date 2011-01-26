require "rails/generators"


class MichaelHintbubleGenerator < Rails::Generators::Base

  # This call establishes the path to the templates directory.
  #
  def self.source_root 
    File.join(File.dirname(__FILE__), "templates")
  end


  # This method copies images, javascript, and stylesheet files to the 
  # corresponding public directories.
  #
  def generate_assets
    copy_file "help_bubble_pointer.png",    "public/images/help_bubble_pointer.png"
    copy_file "error_bubble_pointer.png",   "public/images/error_bubble_pointer.png"
    copy_file "michael_hintbuble.css",      "public/stylesheets/michael_hintbuble.css"
    copy_file "michael_hintbuble.js",       "public/javascripts/michael_hintbuble.js"
  end
  
end