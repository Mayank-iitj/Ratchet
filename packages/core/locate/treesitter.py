import tree_sitter
import tree_sitter_python
import tree_sitter_javascript
import tree_sitter_typescript

class ASTMapper:
    def __init__(self, language: str):
        if language == "python":
            self.lang = tree_sitter.Language(tree_sitter_python.language(), "python")
        elif language == "javascript":
            self.lang = tree_sitter.Language(tree_sitter_javascript.language(), "javascript")
        elif language == "typescript":
            self.lang = tree_sitter.Language(tree_sitter_typescript.language(), "typescript")
        else:
            raise ValueError(f"Unsupported language: {language}")
            
        self.parser = tree_sitter.Parser()
        self.parser.set_language(self.lang)

    def get_enclosing_function(self, source_code: bytes, line_number: int) -> tree_sitter.Node | None:
        """
        Walks the AST to find the function or class that encloses the given line number.
        """
        tree = self.parser.parse(source_code)
        
        def walk(node: tree_sitter.Node) -> tree_sitter.Node | None:
            # Check if this node encompasses the line number (0-indexed in tree-sitter, so -1)
            if node.start_point[0] <= line_number - 1 <= node.end_point[0]:
                # If it's a function or class definition, return it
                if node.type in ["function_definition", "class_definition", "method_definition", "arrow_function", "function_declaration"]:
                    # Try to find a deeper nested function that also contains the line
                    for child in node.children:
                        res = walk(child)
                        if res:
                            return res
                    return node
                
                # Otherwise keep searching children
                for child in node.children:
                    res = walk(child)
                    if res:
                        return res
            return None
            
        return walk(tree.root_node)
