require "rake"
require "rake/testtask"
require "rake/rdoctask"
require "jeweler"


desc "Default: run tests."
task :default => [:test]


desc "Test the plugin."
Rake::TestTask.new(:test) do |t|
  t.libs    << "lib"
  t.pattern  = "test/**/*_test.rb"
  t.verbose  = true
end


desc "Generate documentation for the plugin."
Rake::RDocTask.new(:rdoc) do |rdoc|
  rdoc.rdoc_dir = "rdoc"
  rdoc.title    = "michael_hintbuble"
  rdoc.options << "--line-numbers --inline-source"
  rdoc.rdoc_files.include("README")
  rdoc.rdoc_files.include("lib/**/*.rb")
end


begin
  Jeweler::Tasks.new do |gemspec|
    gemspec.authors           = ["Coroutine", "Tim Lowrimore", "John Dugan"]
    gemspec.description       = "Michael HintBuble allows you to generate hint bubbles and tooltips in Rails applications using the same syntax used for rendering templates."
    gemspec.email             = "gems@coroutine.com"
    gemspec.homepage          = "http://github.com/coroutine/michael_hintbuble"
    gemspec.name              = "michael_hintbuble"
    gemspec.summary           = "Dead simple, beautiful hint bubbles for Rails."
    
    gemspec.add_dependency("actionpack", ">=2.3.4")
    gemspec.add_development_dependency("activesupport", ">=2.3.4")
    
    gemspec.files.include("generators/**/*", "lib/**/*")
    gemspec.files.include("test/**/*")
  end
  Jeweler::GemcutterTasks.new
rescue LoadError
  puts "Jeweler (or a dependency) not available. Install it with: sudo gem install jeweler"
end


