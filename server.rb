require 'socket'
require 'uri'

ROOT = File.expand_path('/Users/moacyrbarros/Documents/moacyr-preview')
PORT = (ENV['PORT'] || 3000).to_i

MIME = {
  '.html' => 'text/html; charset=utf-8',
  '.css'  => 'text/css',
  '.js'   => 'application/javascript',
  '.png'  => 'image/png',
  '.jpg'  => 'image/jpeg',
  '.jpeg' => 'image/jpeg',
  '.svg'  => 'image/svg+xml',
  '.ico'  => 'image/x-icon',
  '.xml'  => 'application/xml',
}

server = TCPServer.new('0.0.0.0', PORT)
$stdout.puts "Servidor rodando em http://localhost:#{PORT}"
$stdout.flush

loop do
  client = server.accept
  request = client.gets
  next unless request

  method, path, _ = request.split(' ')
  path = URI.decode_www_form_component(path.split('?').first)
  path = '/index.html' if path == '/'

  file_path = File.join(ROOT, path)
  file_path = File.expand_path(file_path)

  # Segurança: não sair do ROOT
  unless file_path.start_with?(ROOT)
    client.print "HTTP/1.1 403 Forbidden\r\n\r\n"
    client.close
    next
  end

  # Consumir headers restantes
  while (line = client.gets) && line !~ /^\r?\n$/; end

  if File.file?(file_path)
    ext  = File.extname(file_path).downcase
    mime = MIME[ext] || 'application/octet-stream'
    body = File.binread(file_path)
    client.print "HTTP/1.1 200 OK\r\nContent-Type: #{mime}\r\nContent-Length: #{body.bytesize}\r\nConnection: close\r\n\r\n"
    client.print body
  else
    client.print "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\nNot Found: #{path}"
  end

  client.close
end
