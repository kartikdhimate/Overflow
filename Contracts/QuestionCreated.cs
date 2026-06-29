using System;
using System.Collections.Generic;
using System.Text;

namespace Contracts;

public record QuestionCreated(string QuestionId, string Title, string Content, DateTime Created, List<string> Tags);