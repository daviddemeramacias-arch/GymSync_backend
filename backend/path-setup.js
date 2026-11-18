// Runtime path-alias bootstrap: compiled files live in dist/, not src/
process.env.TS_NODE_BASEURL = process.env.TS_NODE_BASEURL || 'dist';
