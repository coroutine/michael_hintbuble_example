class MichaelHintbubleGenerator < Rails::Generator::Base

  # This method copies images, javascript, and stylesheet files to the 
  # corresponding public directories.
  #
  def manifest
    record do |m|
      m.file "help_bubble_pointer.png",    "public/images/help_bubble_pointer.png"
      m.file "error_bubble_pointer.png",   "public/images/error_bubble_pointer.png"
      m.file "michael_hintbuble.css",      "public/stylesheets/michael_hintbuble.css"
      m.file "michael_hintbuble.js",       "public/javascripts/michael_hintbuble.js"
    end
  end
end