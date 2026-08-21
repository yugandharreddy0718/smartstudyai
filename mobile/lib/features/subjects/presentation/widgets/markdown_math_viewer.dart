import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:markdown/markdown.dart' as md;

class MarkdownMathViewer extends StatelessWidget {
  final String data;
  final ScrollController? scrollController;

  const MarkdownMathViewer({super.key, required this.data, this.scrollController});

  @override
  Widget build(BuildContext context) {
    return Markdown(
      data: data,
      controller: scrollController,
      selectable: true,
      builders: {
        'math': MathElementBuilder(),
        'inline_math': InlineMathElementBuilder(),
      },
      extensionSet: md.ExtensionSet(
        md.ExtensionSet.gitHubFlavored.blockSyntaxes,
        [
          ...md.ExtensionSet.gitHubFlavored.inlineSyntaxes,
          md.EmojiSyntax(),
          InlineMathSyntax(),
        ],
      ),
      styleSheet: MarkdownStyleSheet(
        h1: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
        h2: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
        p: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.6),
        code: TextStyle(
          backgroundColor: Theme.of(context).colorScheme.surfaceContainerHighest,
          fontFamily: 'monospace',
          fontSize: 14,
        ),
        codeblockDecoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}

class InlineMathSyntax extends md.InlineSyntax {
  InlineMathSyntax() : super(r'\$\$(.*?)\$\$|\$(.*?)\$');

  @override
  bool onMatch(md.InlineParser parser, Match match) {
    if (match.group(1) != null) {
      // Block math: $$ ... $$
      final element = md.Element.text('math', match.group(1)!);
      parser.addNode(element);
    } else if (match.group(2) != null) {
      // Inline math: $ ... $
      final element = md.Element.text('inline_math', match.group(2)!);
      parser.addNode(element);
    }
    return true;
  }
}

class MathElementBuilder extends MarkdownElementBuilder {
  @override
  Widget visitElementAfter(md.Element element, TextStyle? preferredStyle) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Center(
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Math.tex(
            element.textContent,
            textStyle: preferredStyle?.copyWith(fontSize: 18),
          ),
        ),
      ),
    );
  }
}

class InlineMathElementBuilder extends MarkdownElementBuilder {
  @override
  Widget visitElementAfter(md.Element element, TextStyle? preferredStyle) {
    return Math.tex(
      element.textContent,
      textStyle: preferredStyle,
    );
  }
}
